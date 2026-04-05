const crypto = require('crypto');

const db = {
  users: [],
  candidates: [],
  election: null
};

class User {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) this._id = crypto.randomBytes(12).toString('hex');
    if (!this.role) this.role = 'user';
    if (!this.hasVoted) this.hasVoted = false;
  }
  static async findOne(query) {
    return db.users.find(u => u.email === query.email) || null;
  }
  static async countDocuments() {
    return db.users.length;
  }
  static async findById(id) {
    const user = db.users.find(u => u._id === id);
    if (!user) return null;
    return {
      ...user,
      select: () => user, // mock select
      save: async function() {
        Object.assign(user, this);
      }
    };
  }
  async save() {
    const existing = db.users.find(u => u._id === this._id);
    if (!existing) db.users.push(this);
    else Object.assign(existing, this);
    return this;
  }
}

class Candidate {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) this._id = crypto.randomBytes(12).toString('hex');
    if (!this.voteCount) this.voteCount = 0;
  }
  static async find() {
    return [...db.candidates];
  }
  static async findById(id) {
    const cand = db.candidates.find(c => c._id === id);
    if (!cand) return null;
    return {
      ...cand,
      save: async function() {
        Object.assign(cand, this);
      }
    }
  }
  async save() {
    const existing = db.candidates.find(c => c._id === this._id);
    if (!existing) db.candidates.push(this);
    else Object.assign(existing, this);
    return this;
  }
}

class Election {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) this._id = crypto.randomBytes(12).toString('hex');
    if (this.isOpen === undefined) this.isOpen = false;
  }
  static async findOne() {
    return db.election;
  }
  async save() {
    db.election = this;
    return this;
  }
}

module.exports = { User, Candidate, Election };
