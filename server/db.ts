// @ts-nocheck
import "./load-env";
import { randomUUID } from "node:crypto";
import knex, { type Knex } from "knex";
import session, { type SessionData } from "express-session";
import {
  type Announcement,
  type Building,
  type Category,
  type Club,
  type ClubMembership,
  type Event,
  type EventSave,
  type InsertAnnouncement,
  type InsertClub,
  type InsertEvent,
  type InsertUser,
  type Notification,
  type Reservation,
  type User,
} from "@shared/schema";

type DbRecord = Record<string, unknown>;

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    return value === "true" || value === "1" || value === "t";
  }
  return false;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeUser(row: DbRecord): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    password: String(row.password),
    profileImage:
      typeof row.profile_image === "string" ? row.profile_image : undefined,
    createdAt: parseDate(row.created_at),
  };
}

function normalizeClub(row: DbRecord): Club {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    categoryId: String(row.category_id),
    memberCount: Number(row.member_count ?? 0),
    imageColor: String(row.image_color),
    contactEmail: String(row.contact_email ?? ""),
    website: String(row.website ?? ""),
    instagram: String(row.instagram ?? ""),
    profileImage:
      typeof row.profile_image === "string" ? row.profile_image : undefined,
    coverImage:
      typeof row.cover_image === "string" ? row.cover_image : undefined,
  };
}

function normalizeEvent(row: DbRecord): Event {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    clubId: String(row.club_id),
    buildingId: String(row.building_id),
    categoryId: String(row.category_id),
    startTime: parseDate(row.start_time),
    endTime: parseDate(row.end_time),
    room: String(row.room),
    hasLimitedCapacity: parseBoolean(row.has_limited_capacity),
    maxCapacity:
      row.max_capacity === null || row.max_capacity === undefined
        ? null
        : Number(row.max_capacity),
    currentReservations: Number(row.current_reservations ?? 0),
    hasFood: parseBoolean(row.has_food),
    foodDescription:
      row.food_description === null || row.food_description === undefined
        ? null
        : String(row.food_description),
    tags: parseStringArray(row.tags),
    isCancelled: parseBoolean(row.is_cancelled),
    coverImage:
      typeof row.cover_image === "string" ? row.cover_image : undefined,
  };
}

function normalizeMembership(row: DbRecord): ClubMembership {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    clubId: String(row.club_id),
    role: row.role as ClubMembership["role"],
    joinedAt: parseDate(row.joined_at),
  };
}

function normalizeSave(row: DbRecord): EventSave {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    eventId: String(row.event_id),
    savedAt: parseDate(row.saved_at),
  };
}

function normalizeReservation(row: DbRecord): Reservation {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    eventId: String(row.event_id),
    reservedAt: parseDate(row.reserved_at),
    status: row.status as Reservation["status"],
  };
}

function normalizeAnnouncement(row: DbRecord): Announcement {
  return {
    id: String(row.id),
    clubId: String(row.club_id),
    title: String(row.title),
    body: String(row.body),
    createdAt: parseDate(row.created_at),
  };
}

function normalizeNotification(row: DbRecord): Notification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type as Notification["type"],
    title: String(row.title),
    body: String(row.body),
    read: parseBoolean(row.read),
    createdAt: parseDate(row.created_at),
    relatedId:
      row.related_id === null || row.related_id === undefined
        ? null
        : String(row.related_id),
  };
}

function getSslConfig() {
  const sslMode = process.env.PGSSLMODE?.toLowerCase();
  const databaseSsl = process.env.DATABASE_SSL?.toLowerCase();
  const useSsl =
    sslMode === "require" ||
    databaseSsl === "true" ||
    databaseSsl === "1" ||
    databaseSsl === "yes";

  return useSsl ? { rejectUnauthorized: false } : undefined;
}

function createDb(): Knex {
  const connectionString = process.env.DATABASE_URL?.trim();
  const ssl = getSslConfig();

  if (connectionString) {
    return knex({
      client: "pg",
      connection: {
        connectionString,
        ssl,
      },
      pool: { min: 0, max: 10 },
    });
  }

  return knex({
    client: "pg",
    connection: {
      host: process.env.PGHOST || "127.0.0.1",
      port: Number.parseInt(process.env.PGPORT || "5432", 10),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "byuconnect",
      ssl,
    },
    pool: { min: 0, max: 10 },
  });
}

export const db = createDb();

export async function initializeDatabase() {
  await db.raw("select 1");
}

function getSessionExpiry(sessionData: SessionData) {
  const cookieExpiry = sessionData.cookie?.expires;
  if (cookieExpiry instanceof Date) {
    return cookieExpiry;
  }
  if (typeof cookieExpiry === "string") {
    const parsed = new Date(cookieExpiry);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  if (typeof sessionData.cookie?.maxAge === "number") {
    return new Date(Date.now() + sessionData.cookie.maxAge);
  }
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export async function pruneExpiredSessions() {
  await db("sessions").where("expires_at", "<=", new Date()).del();
}

export class KnexSessionStore extends session.Store {
  override get(
    sid: string,
    callback: (err?: unknown, sessionData?: SessionData | null) => void,
  ) {
    void db("sessions")
      .first("sess")
      .where({ sid })
      .andWhere("expires_at", ">", new Date())
      .then((row) => {
        if (!row) {
          callback(undefined, null);
          return;
        }
        callback(undefined, JSON.parse(String(row.sess)) as SessionData);
      })
      .catch((error) => callback(error));
  }

  override set(
    sid: string,
    sessionData: SessionData,
    callback?: (err?: unknown) => void,
  ) {
    const expiresAt = getSessionExpiry(sessionData);

    void db("sessions")
      .insert({
        sid,
        sess: JSON.stringify(sessionData),
        expires_at: expiresAt,
      })
      .onConflict("sid")
      .merge({
        sess: JSON.stringify(sessionData),
        expires_at: expiresAt,
      })
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }

  override destroy(sid: string, callback?: (err?: unknown) => void) {
    void db("sessions")
      .where({ sid })
      .del()
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }

  override touch(
    sid: string,
    sessionData: SessionData,
    callback?: () => void,
  ) {
    const expiresAt = getSessionExpiry(sessionData);
    void db("sessions")
      .where({ sid })
      .update({
        sess: JSON.stringify(sessionData),
        expires_at: expiresAt,
      })
      .finally(() => callback?.());
  }
}

export class PostgresStorage {
  async getUser(id: string) {
    const row = await db("users").where({ id }).first();
    return row ? normalizeUser(row) : undefined;
  }

  async getUserByEmail(email: string) {
    const row = await db("users").where({ email }).first();
    return row ? normalizeUser(row) : undefined;
  }

  async createUser(insertUser: InsertUser) {
    const id = randomUUID();
    const createdAt = new Date();
    await db("users").insert({
      id,
      email: insertUser.email,
      name: insertUser.name,
      password: insertUser.password,
      created_at: createdAt,
    });

    return normalizeUser({
      id,
      email: insertUser.email,
      name: insertUser.name,
      password: insertUser.password,
      profile_image: null,
      created_at: createdAt,
    });
  }

  async updateUserProfileImage(id: string, imageUrl: string) {
    await db("users").where({ id }).update({ profile_image: imageUrl });
  }

  async getBuildings() {
    const rows = await db("buildings").select("*").orderBy("name", "asc");
    return rows as Building[];
  }

  async getCategories() {
    const rows = await db("categories").select("*").orderBy("name", "asc");
    return rows as Category[];
  }

  async getClubs() {
    const rows = await db("clubs").select("*").orderBy("name", "asc");
    return rows.map(normalizeClub);
  }

  async getClub(id: string) {
    const row = await db("clubs").where({ id }).first();
    return row ? normalizeClub(row) : undefined;
  }

  async createClub(insertClub: InsertClub) {
    const id = randomUUID();
    await db("clubs").insert({
      id,
      name: insertClub.name,
      description: insertClub.description,
      category_id: insertClub.categoryId,
      member_count: 0,
      image_color: insertClub.imageColor,
      contact_email: insertClub.contactEmail,
      website: insertClub.website,
      instagram: insertClub.instagram,
    });

    return normalizeClub({
      id,
      name: insertClub.name,
      description: insertClub.description,
      category_id: insertClub.categoryId,
      member_count: 0,
      image_color: insertClub.imageColor,
      contact_email: insertClub.contactEmail,
      website: insertClub.website,
      instagram: insertClub.instagram,
      profile_image: null,
      cover_image: null,
    });
  }

  async updateClub(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      contactEmail: string;
      website: string;
      instagram: string;
    }>,
  ) {
    const dbUpdates: DbRecord = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;

    if (Object.keys(dbUpdates).length > 0) {
      await db("clubs").where({ id }).update(dbUpdates);
    }

    return this.getClub(id);
  }

  async updateClubProfileImage(id: string, imageUrl: string) {
    await db("clubs").where({ id }).update({ profile_image: imageUrl });
  }

  async updateClubCoverImage(id: string, imageUrl: string) {
    await db("clubs").where({ id }).update({ cover_image: imageUrl });
  }

  async getEvents() {
    const rows = await db("events").select("*").orderBy("start_time", "asc");
    return rows.map(normalizeEvent);
  }

  async getEvent(id: string) {
    const row = await db("events").where({ id }).first();
    return row ? normalizeEvent(row) : undefined;
  }

  async createEvent(insertEvent: InsertEvent) {
    const id = randomUUID();
    await db("events").insert({
      id,
      title: insertEvent.title,
      description: insertEvent.description,
      club_id: insertEvent.clubId,
      building_id: insertEvent.buildingId,
      category_id: insertEvent.categoryId,
      start_time: insertEvent.startTime,
      end_time: insertEvent.endTime,
      room: insertEvent.room,
      has_limited_capacity: insertEvent.hasLimitedCapacity,
      max_capacity: insertEvent.maxCapacity,
      current_reservations: 0,
      has_food: insertEvent.hasFood,
      food_description: insertEvent.foodDescription,
      tags: insertEvent.tags,
      is_cancelled: false,
    });

    return normalizeEvent({
      id,
      title: insertEvent.title,
      description: insertEvent.description,
      club_id: insertEvent.clubId,
      building_id: insertEvent.buildingId,
      category_id: insertEvent.categoryId,
      start_time: insertEvent.startTime,
      end_time: insertEvent.endTime,
      room: insertEvent.room,
      has_limited_capacity: insertEvent.hasLimitedCapacity,
      max_capacity: insertEvent.maxCapacity,
      current_reservations: 0,
      has_food: insertEvent.hasFood,
      food_description: insertEvent.foodDescription,
      tags: insertEvent.tags,
      is_cancelled: false,
      cover_image: null,
    });
  }

  async updateEvent(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      buildingId: string;
      categoryId: string;
      startTime: Date;
      endTime: Date;
      room: string;
      hasLimitedCapacity: boolean;
      maxCapacity: number | null;
      hasFood: boolean;
      foodDescription: string | null;
      tags: string[];
    }>,
  ) {
    const dbUpdates: DbRecord = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.buildingId !== undefined) dbUpdates.building_id = updates.buildingId;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.room !== undefined) dbUpdates.room = updates.room;
    if (updates.hasLimitedCapacity !== undefined) {
      dbUpdates.has_limited_capacity = updates.hasLimitedCapacity;
    }
    if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity;
    if (updates.hasFood !== undefined) dbUpdates.has_food = updates.hasFood;
    if (updates.foodDescription !== undefined) {
      dbUpdates.food_description = updates.foodDescription;
    }
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    if (Object.keys(dbUpdates).length > 0) {
      await db("events").where({ id }).update(dbUpdates);
    }

    return this.getEvent(id);
  }

  async updateEventCoverImage(id: string, imageUrl: string) {
    await db("events").where({ id }).update({ cover_image: imageUrl });
  }

  async getMemberships(userId: string) {
    const rows = await db("club_memberships")
      .where({ user_id: userId })
      .orderBy("joined_at", "desc");
    return rows.map(normalizeMembership);
  }

  async getMembershipForUserClub(userId: string, clubId: string) {
    const row = await db("club_memberships")
      .where({ user_id: userId, club_id: clubId })
      .first();
    return row ? normalizeMembership(row) : undefined;
  }

  async joinClub(userId: string, clubId: string) {
    return db.transaction(async (trx) => {
      const existing = await trx("club_memberships")
        .where({ user_id: userId, club_id: clubId })
        .first();

      if (existing) {
        return normalizeMembership(existing);
      }

      const id = randomUUID();
      const joinedAt = new Date();
      await trx("club_memberships").insert({
        id,
        user_id: userId,
        club_id: clubId,
        role: "member",
        joined_at: joinedAt,
      });
      await trx("clubs")
        .where({ id: clubId })
        .update({
          member_count: trx.raw("GREATEST(member_count + 1, 0)"),
        });

      return normalizeMembership({
        id,
        user_id: userId,
        club_id: clubId,
        role: "member",
        joined_at: joinedAt,
      });
    });
  }

  async leaveClub(userId: string, clubId: string) {
    await db.transaction(async (trx) => {
      const removed = await trx("club_memberships")
        .where({ user_id: userId, club_id: clubId })
        .del();

      if (removed > 0) {
        await trx("clubs")
          .where({ id: clubId })
          .update({
            member_count: trx.raw("GREATEST(member_count - 1, 0)"),
          });
      }
    });
  }

  async getSaves(userId: string) {
    const rows = await db("event_saves")
      .where({ user_id: userId })
      .orderBy("saved_at", "desc");
    return rows.map(normalizeSave);
  }

  async saveEvent(userId: string, eventId: string) {
    const existing = await db("event_saves")
      .where({ user_id: userId, event_id: eventId })
      .first();
    if (existing) {
      return normalizeSave(existing);
    }

    const id = randomUUID();
    const savedAt = new Date();
    await db("event_saves").insert({
      id,
      user_id: userId,
      event_id: eventId,
      saved_at: savedAt,
    });

    return normalizeSave({
      id,
      user_id: userId,
      event_id: eventId,
      saved_at: savedAt,
    });
  }

  async unsaveEvent(userId: string, eventId: string) {
    await db("event_saves").where({ user_id: userId, event_id: eventId }).del();
  }

  async getReservations(userId: string) {
    const rows = await db("reservations")
      .where({ user_id: userId, status: "confirmed" })
      .orderBy("reserved_at", "desc");
    return rows.map(normalizeReservation);
  }

  async makeReservation(userId: string, eventId: string) {
    return db.transaction(async (trx) => {
      const event = await trx("events")
        .where({ id: eventId })
        .forUpdate()
        .first();

      if (!event) {
        return null;
      }

      if (
        parseBoolean(event.has_limited_capacity) &&
        event.max_capacity !== null &&
        event.max_capacity !== undefined &&
        Number(event.current_reservations) >= Number(event.max_capacity)
      ) {
        return null;
      }

      const existing = await trx("reservations")
        .where({ user_id: userId, event_id: eventId, status: "confirmed" })
        .first();
      if (existing) {
        return normalizeReservation(existing);
      }

      const id = randomUUID();
      const reservedAt = new Date();
      await trx("reservations").insert({
        id,
        user_id: userId,
        event_id: eventId,
        reserved_at: reservedAt,
        status: "confirmed",
      });
      await trx("events")
        .where({ id: eventId })
        .update({
          current_reservations: trx.raw("current_reservations + 1"),
        });

      return normalizeReservation({
        id,
        user_id: userId,
        event_id: eventId,
        reserved_at: reservedAt,
        status: "confirmed",
      });
    });
  }

  async cancelReservation(userId: string, eventId: string) {
    await db.transaction(async (trx) => {
      const updated = await trx("reservations")
        .where({ user_id: userId, event_id: eventId, status: "confirmed" })
        .update({ status: "cancelled" });

      if (updated > 0) {
        await trx("events")
          .where({ id: eventId })
          .update({
            current_reservations: trx.raw("GREATEST(current_reservations - 1, 0)"),
          });
      }
    });
  }

  async getAnnouncements(clubId?: string) {
    const query = db("announcements").select("*").orderBy("created_at", "desc");
    const rows = clubId ? await query.where({ club_id: clubId }) : await query;
    return rows.map(normalizeAnnouncement);
  }

  async createAnnouncement(announcement: InsertAnnouncement) {
    const id = randomUUID();
    const createdAt = new Date();
    await db("announcements").insert({
      id,
      club_id: announcement.clubId,
      title: announcement.title,
      body: announcement.body,
      created_at: createdAt,
    });

    return normalizeAnnouncement({
      id,
      club_id: announcement.clubId,
      title: announcement.title,
      body: announcement.body,
      created_at: createdAt,
    });
  }

  async getNotifications(userId: string) {
    const rows = await db("notifications")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
    return rows.map(normalizeNotification);
  }

  async markNotificationRead(id: string) {
    await db("notifications").where({ id }).update({ read: true });
  }
}
