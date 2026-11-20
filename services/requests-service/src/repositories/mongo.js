import { MongoClient, ObjectId } from "mongodb";

function serialize(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
}

export class MongoRequestsRepository {
    constructor(mongoUri, dbName) {
        this.client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
        this.dbName = dbName;
        this.collection = null;
    }

    async connect() {
        await this.client.connect();
        const db = this.client.db(this.dbName);
        this.collection = db.collection("pickup_requests");
        await this.collection.createIndex({ createdAt: -1 });
        await this.collection.createIndex({ status: 1 });
    }

    async close() {
        await this.client.close();
    }

    async ping() {
        await this.client.db(this.dbName).command({ ping: 1 });
    }

    async list({ status } = {}) {
        const filter = status ? { status } : {};
        const docs = await this.collection.find(filter).sort({ createdAt: -1 }).toArray();
        return docs.map(serialize);
    }

    async create(record) {
        const now = new Date().toISOString();
        const document = {
            ...record,
            status: "PENDIENTE",
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.collection.insertOne(document);
        return serialize({ _id: result.insertedId, ...document });
    }

    async updateStatus(id, status) {
        if (!ObjectId.isValid(id)) return null;
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date().toISOString() } },
            { returnDocument: "after" },
        );
        return serialize(result);
    }

    async remove(id) {
        if (!ObjectId.isValid(id)) return false;
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}