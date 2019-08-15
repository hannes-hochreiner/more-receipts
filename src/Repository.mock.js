export default class Repository {
  constructor(uuid, PouchDb) {
    this._uuid = uuid;
    this._db = new PouchDb('https://receipt.hochreiner.net/api');
    console.log(this._db);
    this.createCategories();
    this._receipts = [];
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

  getCategories() {
    return new Promise((res) => {
      res(this._categories);
    });
  }

  getReceipts(start, end) {
    return new Promise((res) => {
      res(this._receipts.filter(elem => elem.date.localeCompare(start) > -1 && elem.date.localeCompare(end) < 1));
    });
  }

  updateObject(obj) {
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
