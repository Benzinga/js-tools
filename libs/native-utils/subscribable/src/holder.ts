import { Subscribable } from './subscribable';

export class SubscribableHolder<T> extends Subscribable<{ type: 'update'; value: T }> {
  private value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  public update = (value: T) => {
    this.value = value;
    this.dispatch({
      type: 'update',
      value,
    });
  };

  public getValue = () => this.value;
}
