class Filter {
  constructor (filter, props) {
    this._filter = filter;

    this.input = null;
    this.output = null;
  }

  connect (input, output) {
    this.input = input;
    this.output = output;

    // this._filter.disconnect()

    console.log(this._filter)
    this.input.connect(this._filter);
    this._filter.connect(this.output);
  }

  disconnect() {
    this._filter.disconnect();

    this.input = null;
    this.output = null;
  }
}

export default Filter;