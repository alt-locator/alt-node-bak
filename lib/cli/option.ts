export class Option {
  value: boolean|number|string;

  constructor(public name: string, public type: string,
              public description: string,
              public defaultValue?: boolean|number|string) {}

  getNumber(): number {
    let value = this.getValue_();
    if (value != null &&
        (typeof value === 'number' || typeof value === 'string')) {
      return +value;
    } else {
      return null;
    }
  }

  getString(): string {
    let value = this.getValue_();
    if (value != null) {
      return '' + this.getValue_();
    } else {
      return '';
    }
  }

  getBoolean(): boolean {
    let value = this.getValue_();
    if (value != null) {
      if (typeof value === 'string') {
        return !(value === '0' || value === 'false');
      } else if (typeof value === 'number') {
        return value !== 0;
      } else {
        return value;
      }
    }
    return false;
  }

  private getValue_(): number|string|boolean {
    if (typeof this.value !== 'undefined') {
      return this.value;
    } else {
      return this.defaultValue;
    }
  }
}
