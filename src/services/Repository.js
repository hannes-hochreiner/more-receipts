export default class Repository {
  constructor(ps, PouchDb) {
    this._ps = ps;
    this._dbName = 'receipt';
    this._dbSyncTarget = 'https://receipt.hochreiner.net/api';
    this._pouchdb = new PouchDb(this._dbName, {auto_compaction: true});

    this._ps.subscribe('sys.getCategories.request', this.getCategories.bind(this));
    this._ps.subscribe('sys.updateCategory.request', this.updateCategory.bind(this));
    this._ps.subscribe('sys.getReceiptsInInterval.request', this.getReceiptsInInterval.bind(this));
    this._ps.subscribe('sys.updateReceipt.request', this.updateReceipt.bind(this));
    this._ps.subscribe('sys.synchronizeDatabase.request', this.sync.bind(this));
  }

  async sync(topic) {
    console.log('starting sync');
    let tt = topic.split('.');
    tt[2] = 'response';

    try {
      await this._getIdToken();
      let res = await this._pouchdb.sync(this._dbSyncTarget);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  _getIdToken() {
    return new Promise(function(resolve, reject) {
      let pst = this._ps.subscribe('sys.getIdToken.response', function(topic, data) {
        this._ps.unsubscribe(pst);

        if (!data) {
          reject();
          return;
        }

        if (data.error) {
          reject(data.error);
          return;
        }

        resolve(data);
      }.bind(this));

      this._ps.publish('sys.getIdToken.request');
    }.bind(this));
  }

  async getCategories(topic) {
    let tt = topic.split('.');
    tt[2] = 'response';

    try {
      let res = await this._pouchdb.allDocs({
        include_docs: true,
        startkey: 'category',
        endkey: 'category\ufff0'
      });

      this._ps.publish(tt.join('.'), {
        ok: true,
        categories: res.rows.map(function(elem) { return elem.doc; })
      });
    } catch (err) {
      this._ps.publish(tt.join('.'), {
        error: err
      });
    }
  }

  async updateCategory(topic, data) {
    let tt = topic.split('.');
    tt[2] = 'response';

    try {
      if (!data || data.type != 'category') {
        this._ps.publish(tt.join('.'), {
          error: new Error('no object to update or wrong object type')
        });
        return;
      }

      if (typeof data._id === 'undefined') {
        data._id = `category/${data.id}`;
      }
      
      this._ps.publish(tt.join('.'), await this._pouchdb.put(data));
    } catch (err) {
      this._ps.publish(tt.join('.'), { error: err });
    }
  }

  async getReceiptsInInterval(topic, data) {
    let tt = topic.split('.');
    tt[2] = 'response';

    try {
      if (!data || !data.start || !data.end) {
        this._ps.publish(tt.join('.'), {
          error: new Error('no interval provided')
        });
        return;
      }

      let res = await this._pouchdb.allDocs({
        include_docs: true,
        startkey: `receipt/${data.start}_`,
        endkey: `receipt/${data.end}_\ufff0`
      });

      this._ps.publish(tt.join('.'), {
        ok: true,
        receipts: res.rows.map(function(elem) { return elem.doc; })
      });
    } catch (err) {
      this._ps.publish(tt.join('.'), { error: err });
    }
  }

  async updateReceipt(topic, data) {
    let tt = topic.split('.');
    tt[2] = 'response';

    try {
      if (!data || data.type != 'receipt') {
        this._ps.publish(tt.join('.'), {
          error: new Error('no object to update or wrong object type')
        });
        return;
      }

      if (typeof data._id === 'undefined') {
        data._id = `receipt/${data.date}_${data.id}`;
      }
      
      this._ps.publish(tt.join('.'), await this._pouchdb.put(data));
    } catch (err) {
      this._ps.publish(tt.join('.'), { error: err });
    }
  }
}