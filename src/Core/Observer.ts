export interface Observer<T> {
  update(value: T): void;
}

export class Subject<T> {
  private observers = new Set<Observer<T>>();

  subscribe(o: Observer<T>) { this.observers.add(o); }
  unsubscribe(o: Observer<T>) { this.observers.delete(o); }

  protected notifyAll(value: T) {
    for (const o of this.observers) o.update(value);
  }
}
