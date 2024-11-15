import { SubscriberId } from './subscribable';
import { setDifference, setIntersection } from '@benzinga/helper-functions';

export class SubscriptionFieldTracker {
  private readonly subscriptions: Map<SubscriberId, Set<string>> = new Map();
  private readonly fields = new Map<string, number>();
  private readonly updateFields: (fields: Set<string>) => void;

  constructor(updateFields: (fields: Set<string>) => void) {
    this.updateFields = updateFields;
  }

  public onSubscribe(id: SubscriberId, fields: Set<string> | undefined): void {
    fields = fields ?? new Set();
    this.subscriptions.set(id, fields);
    this.addField(fields);
  }

  public onUpdate(id: SubscriberId, fields: Set<string> | undefined): void {
    fields = fields ?? new Set();
    const oldFields = this.subscriptions.get(id);
    if (oldFields) {
      const added = setDifference(fields, oldFields);
      const removed = setDifference(oldFields, fields);

      if (added.size > 0) {
        this.addField(new Set(added));
      }
      if (removed.size > 0) {
        this.removeField(new Set(removed));
      }
      this.subscriptions.set(id, fields);
    } else {
      this.addField(fields);
    }
  }

  public onUnsubscribe(id: SubscriberId): void {
    this.removeField(this.subscriptions.get(id) ?? new Set());
    this.subscriptions.delete(id);
  }

  private addField(fields: Set<string>): void {
    fields.forEach(field => {
      const val = this.fields.get(field) ?? 0;
      this.fields.set(field, val + 1);
    });
    this.updateFields(new Set(this.fields.keys()));
  }

  private removeField(fields: Set<string>): void {
    fields.forEach(field => {
      const count = this.fields.get(field) ?? 0;
      if (count === 1) {
        this.fields.delete(field);
      } else if (count === 0) {
        return;
      } else {
        this.fields.set(field, count - 1);
      }
    });

    this.updateFields(new Set(this.fields.keys()));
  }
}

export class LimitedSubscriptionFieldTracker extends SubscriptionFieldTracker {
  private readonly possibleFields: Set<string>;

  constructor(updateFields: (fields: Set<string>) => void, possibleFields: Set<string>) {
    super(updateFields);
    this.possibleFields = possibleFields;
  }

  public override onSubscribe(id: SubscriberId, fields: Set<string> | undefined): void {
    fields = setIntersection(fields ?? new Set(), this.possibleFields);
    super.onSubscribe(id, fields);
  }

  public override onUpdate(id: SubscriberId, fields: Set<string> | undefined): void {
    fields = setIntersection(fields ?? new Set(), this.possibleFields);
    super.onUpdate(id, fields);
  }
}
