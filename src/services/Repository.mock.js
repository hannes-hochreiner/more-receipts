export default class Repository {
  constructor(ps, uuid) {
    this._ps = ps;
    this._uuid = uuid;
    this.createCategories();
    this._receipts = [];

    this._ps.subscribe('sys.getCategories.request', this._getCategories.bind(this));
    this._ps.subscribe('sys.updateObjects.request', this._updateObjects.bind(this));
    this._ps.subscribe('sys.getReceiptsInInterval.request', this._getReceiptsInInterval.bind(this));
  }

  createCategories() {
    this._categories = [
      { type: 'category', id: this._uuid(), title: 'vegetables' },
      { type: 'category', id: this._uuid(), title: 'personal hygiene' },
      { type: 'category', id: this._uuid(), title: 'fruit' }
    ].map(e => {
      e._id = `category/${e.id}`;
      e._rev = 1;

      return e;
    });
  }

  _getCategories(topic) {
    this._ps.publish(`sys.getCategories.response.${topic.split('.')[3]}`, {
      ok: true,
      categories: this._categories
    });
  }

  _getReceiptsInInterval(topic, data) {
    if (!data.start || !data.end) {
      this._ps.publish(`sys.getReceiptsInInterval.response.${topic.split('.')[3]}`, {
        error: 'interval not defined'
      });

      return;
    }

    this._ps.publish(`sys.getReceiptsInInterval.response.${topic.split('.')[3]}`, {
      ok: true,
      receipts: this._receipts.filter(elem => elem.date.localeCompare(data.start) > -1 && elem.date.localeCompare(data.end) < 1)
    });
  }

  async _updateObjects(topic, data) {
    for (let idx in data.objects) {
      await this._updateObject(data.objects[idx]);
    }

    this._ps.publish(`sys.updateObjects.response.${topic.split('.')[3]}`, {
      ok: true
    });
  }

  _updateObject(obj) {
    return new Promise((res, rej) => {
      if (typeof obj._id !== 'undefined') {
        let key;
  
        if (obj.type === 'category') {
          key = '_categories';
        } else if (obj.type === 'receipt') {
          key = '_receipts';
        }
  
        let oldElemIdx = this[key].findIndex(elem => elem._id === obj._id);
  
        if (this[key][oldElemIdx]._rev !== obj._rev) {
          rej('Incorrect object revision');
          return;
        }
  
        obj._rev += 1;
  
        this[key].splice(oldElemIdx, 1, obj);
      } else {
        if (obj.type === 'category') {
          obj._id = `category/${obj.id}`;
          obj._rev = 1;
          this._categories.push(obj);
        } else if (obj.type === 'receipt') {
          obj._id = `receipt/${obj.date}_${obj.id}`;
          obj._rev = 1;
          this._receipts.push(obj);
        }
      }

      res();
    });
  }
}
