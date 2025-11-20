const conn = require("./connection");
const { ObjectId } = require("mongodb");

const Tutorial = function (val) {
    this.title = val.title;
    this.description = val.description;
    this.published = val.published;
};

Tutorial.getAll = async (page, size, title, result) => {
    page = parseInt(page ?? 0);
    size = parseInt(size ?? 0);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(size) || size < 1) size = 5;

    const offset = (page - 1) * size;
    const condition = title
        ? { title: { $regex: new RegExp(title), $options: "i" } }
        : {};

    const count = await conn.db().collection("tutorials").countDocuments();
    const data = await conn
        .db()
        .collection("tutorials")
        .find(condition)
        .skip(offset)
        .limit(size)
        .toArray();

    result(null, {
        pages: size,
        current: page,
        data: data,
        total: count,
    });
};

Tutorial.getById = async (id, result) => {
    const data = await conn
        .db()
        .collection("tutorials")
        .findOne({ _id: new ObjectId(id) });

    if (data) {
        result(null, data);
        return;
    }

    result({ kind: "not_found" }, null);
};

Tutorial.getPublished = async (result) => {
    const data = await conn
        .db()
        .collection("tutorials")
        .find({ published: true })
        .toArray();

    result(null, data);
};

Tutorial.create = async (val, result) => {
    try {
        const res = await conn.db().collection("tutorials").insertOne(val);
        result(null, { id: res._id, ...val });
    } catch (err) {
        result(err, null);
    }
};

Tutorial.update = async (id, val, result) => {
    try {
        const res = await conn
            .db()
            .collection("tutorials")
            .updateOne({ _id: new ObjectId(id) }, { $set: val });
        if (res.matchedCount == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, { id: id, ...val });
    } catch (err) {
        result(err, null);
    }
};

Tutorial.remove = async (id, result) => {
    try {
        const res = await conn
            .db()
            .collection("tutorials")
            .deleteOne({ _id: new ObjectId(id) });
        if (res.deletedCount == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    } catch (err) {
        result(err, null);
    }
};

Tutorial.removeAll = async (result) => {
    try {
        const res = await conn.db().collection("tutorials").deleteMany({});
        if (res.deletedCount == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    } catch (err) {
        result(err, null);
    }
};

module.exports = Tutorial;
