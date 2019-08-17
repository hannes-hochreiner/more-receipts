export default class Repository {
  constructor(ps, pouchdb) {
    this._ps = ps;
    this._pouchdb = pouchdb;

    this._ps.subscribe('sys.getCategories.request', this.getCategories.bind(this));
    this._ps.subscribe('sys.updateCategory.request', this.updateCategory.bind(this));
    this._ps.subscribe('sys.getReceiptsInInterval.request', this.getReceiptsInInterval.bind(this));
    this._ps.subscribe('sys.updateReceipt.request', this.updateReceipt.bind(this));
  }

  async getCategories(topic) {
    try {
      let tt = topic.split('.');
      tt[2] = 'response';
  
      let res = await this._pouchdb.allDocs({
        include_docs: true,
        startKey: 'category',
        endKey: 'category\ufff0'
      });

      this._ps.publish(tt.join('.'), {
        ok: true,
        categories: res.rows
      });
    } catch (err) {
      this._ps.publish(tt.join('.'), {
        error: err
      });
    }
  }

  async updateCategory(topic, data) {
    try {
      let tt = topic.split('.');
      tt[2] = 'response';

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
    try {
      let tt = topic.split('.');
      tt[2] = 'response';

      if (!data || !data.start || !data.end) {
        this._ps.publish(tt.join('.'), {
          error: new Error('no interval provided')
        });
        return;
      }

      let res = await this._pouchdb.allDocs({
        include_docs: true,
        startKey: `receipt/${data.start}_`,
        endKey: `receipt/${data.end}_\ufff0`
      });

      this._ps.publish(tt.join('.'), {
        ok: true,
        receipts: res.rows
      });
    } catch (err) {
      this._ps.publish(tt.join('.'), { error: err });
    }
  }

  async updateReceipt(topic, data) {
    try {
      let tt = topic.split('.');
      tt[2] = 'response';

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