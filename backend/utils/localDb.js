const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(modelName) {
  return path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
}

function readData(modelName) {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeData(modelName, data) {
  const filePath = getFilePath(modelName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

class LocalModelInstance {
  constructor(modelName, data) {
    this._modelName = modelName;
    Object.assign(this, data);
  }

  async save() {
    const dataList = readData(this._modelName);
    if (!this._id) {
      this._id = generateId();
      this.createdAt = new Date().toISOString();
      dataList.push(this.toObject());
    } else {
      const index = dataList.findIndex(item => item._id === this._id);
      if (index !== -1) {
        dataList[index] = this.toObject();
      } else {
        dataList.push(this.toObject());
      }
    }
    writeData(this._modelName, dataList);
    return this;
  }

  toObject() {
    const obj = {};
    for (const key of Object.keys(this)) {
      if (key !== '_modelName') {
        obj[key] = this[key];
      }
    }
    return obj;
  }
}

function getLocalModel(modelName, schemaDef) {
  return {
    modelName,
    find: async function(query = {}) {
      let data = readData(modelName);
      
      // Simple query filter
      data = data.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined) {
            // Support regex searching (e.g. for search queries)
            if (query[key] instanceof RegExp) {
              if (!query[key].test(item[key] || '')) return false;
            }
            // Support Mongoose query options like $in
            else if (query[key] && typeof query[key] === 'object' && query[key].$in) {
              const vals = Array.isArray(query[key].$in) ? query[key].$in : [];
              if (!vals.includes(item[key])) return false;
            }
            // Support numerical range queries (e.g., price filters like $gte, $lte)
            else if (query[key] && typeof query[key] === 'object' && (query[key].$gte !== undefined || query[key].$lte !== undefined)) {
              const val = Number(item[key]);
              if (query[key].$gte !== undefined && val < Number(query[key].$gte)) return false;
              if (query[key].$lte !== undefined && val > Number(query[key].$lte)) return false;
            }
            // Standard direct match
            else if (item[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      });

      return data.map(item => new LocalModelInstance(modelName, item));
    },

    findOne: async function(query = {}) {
      const items = await this.find(query);
      return items.length > 0 ? items[0] : null;
    },

    findById: async function(id) {
      return this.findOne({ _id: id });
    },

    create: async function(data) {
      const instance = new LocalModelInstance(modelName, data);
      await instance.save();
      return instance;
    },

    findByIdAndUpdate: async function(id, update, options = {}) {
      const items = readData(modelName);
      const index = items.findIndex(item => item._id === id);
      if (index === -1) return null;

      let updatedData = { ...items[index] };
      
      // Check if update is direct fields or has $push, $pull (like mongoose)
      if (update.$push) {
        for (const key in update.$push) {
          updatedData[key] = updatedData[key] || [];
          // Ensure it's an array before pushing
          if (!Array.isArray(updatedData[key])) {
            updatedData[key] = [updatedData[key]];
          }
          updatedData[key].push(update.$push[key]);
        }
      } else if (update.$pull) {
        for (const key in update.$pull) {
          if (Array.isArray(updatedData[key])) {
            updatedData[key] = updatedData[key].filter(v => v !== update.$pull[key]);
          }
        }
      } else {
        // Direct field updates
        const fieldsToUpdate = update.$set || update;
        updatedData = { ...updatedData, ...fieldsToUpdate };
      }

      items[index] = updatedData;
      writeData(modelName, items);
      return new LocalModelInstance(modelName, updatedData);
    },

    findByIdAndDelete: async function(id) {
      const items = readData(modelName);
      const index = items.findIndex(item => item._id === id);
      if (index === -1) return null;
      const deleted = items.splice(index, 1)[0];
      writeData(modelName, items);
      return new LocalModelInstance(modelName, deleted);
    },

    deleteMany: async function(query = {}) {
      let items = readData(modelName);
      const initialLength = items.length;
      items = items.filter(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return true; // keep
        }
        return false; // delete
      });
      writeData(modelName, items);
      return { deletedCount: initialLength - items.length };
    },

    countDocuments: async function(query = {}) {
      const items = await this.find(query);
      return items.length;
    }
  };
}

module.exports = { getLocalModel };
