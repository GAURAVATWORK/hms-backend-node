
import { createHmac, timingSafeEqual } from "node:crypto";
import env from "../config/env.js";

const CURSOR_VERSION = 1;
const MAX_CURSOR_LENGTH = 2048;

const CURSOR_SECRET = Buffer.from(env.adminDoctorCursorSecret, "hex");

const VALID_REGISTRATION_STATUSES = new Set([
  "NEW",
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

const createCursorError = () => {
  const error = new Error("Invalid cursor");
  error.code = "INVALID_CURSOR";
  error.statusCode = 400;
  return error;
};

const isValidTimestamp = (value) => {
  if (
    typeof value !== "string" ||
    !TIMESTAMP_PATTERN.test(value)
  ) {
    return false;
  }

  const datePart = value.slice(0, 19);
  const parsedDate = new Date(`${datePart}Z`);

  return (
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 19) === datePart
  );
};

const isValidUserId = (value) =>
  typeof value === "string" && UUID_PATTERN.test(value);

const normalizeFilters = ({
  emailVerified = null,
  registrationStatus = null,
} = {}) => {
  if (
    emailVerified !== null &&
    typeof emailVerified !== "boolean"
  ) {
    throw createCursorError();
  }

  if (
    registrationStatus !== null &&
    !VALID_REGISTRATION_STATUSES.has(registrationStatus)
  ) {
    throw createCursorError();
  }

  // Registration review applies only to email-verified accounts.
  if (registrationStatus !== null) {
    if (emailVerified === false) {
      throw createCursorError();
    }

    emailVerified = true;
  }

  return { emailVerified, registrationStatus };
};

const createSignature = (encodedPayload) =>
  createHmac("sha256", CURSOR_SECRET)
    .update(encodedPayload)
    .digest("base64url");

const encodeCursor = ({
  emailVerified = null,
  registrationStatus = null,
  createdAt,
  userId,
}) => {
  try {
    const filters = normalizeFilters({
      emailVerified,
      registrationStatus,
    });

    if (
      !isValidTimestamp(createdAt) ||
      !isValidUserId(userId)
    ) {
      throw createCursorError();
    }

    const payload = {
      version: CURSOR_VERSION,
      ...filters,
      createdAt,
      userId,
    };

    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
      "utf8",
    ).toString("base64url");

    const signature = createSignature(encodedPayload);
    const cursor = `${encodedPayload}.${signature}`;

    if (cursor.length > MAX_CURSOR_LENGTH) {
      throw createCursorError();
    }

    return cursor;
  } catch {
    throw createCursorError();
  }
};

const decodeCursor = (
  cursor,
  expectedFilters = {},
) => {
  try {
    const filters = normalizeFilters(expectedFilters);

    if (
      typeof cursor !== "string" ||
      cursor.length === 0 ||
      cursor.length > MAX_CURSOR_LENGTH
    ) {
      throw createCursorError();
    }

    const parts = cursor.split(".");

    if (parts.length !== 2) {
      throw createCursorError();
    }

    const [encodedPayload, receivedSignature] = parts;

    if (
      !/^[A-Za-z0-9_-]+$/.test(encodedPayload) ||
      !/^[A-Za-z0-9_-]{43}$/.test(receivedSignature)
    ) {
      throw createCursorError();
    }

    const expectedSignature = createSignature(encodedPayload);

    const receivedBuffer = Buffer.from(
      receivedSignature,
      "base64url",
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "base64url",
    );

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      throw createCursorError();
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      payload.version !== CURSOR_VERSION ||
      payload.emailVerified !== filters.emailVerified ||
      payload.registrationStatus !== filters.registrationStatus ||
      !isValidTimestamp(payload.createdAt) ||
      !isValidUserId(payload.userId)
    ) {
      throw createCursorError();
    }

    return {
      emailVerified: payload.emailVerified,
      registrationStatus: payload.registrationStatus,
      createdAt: payload.createdAt,
      userId: payload.userId,
    };
  } catch {
    throw createCursorError();
  }
};

export { encodeCursor, decodeCursor };
