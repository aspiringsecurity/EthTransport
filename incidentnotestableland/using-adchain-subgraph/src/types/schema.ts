import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt
} from "@graphprotocol/graph-ts";

export class Application extends Entity {
  constructor(id: string) {
    this.set("id", Value.fromString(id));
    return this;
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Application entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Application entity with non-string ID"
    );
    store.set("Application", id.toString(), this);
  }

  static load(id: string): Application | null {
    return store.get("Application", id) as Application | null;
  }

  get id(): string {
    let value = this.get("id");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set id(value: string) {
    if (value === null) {
      this.unset("id");
    } else {
      this.set("id", Value.fromString(value as string));
    }
  }

  get whitelisted(): boolean | null {
    let value = this.get("whitelisted");
    if (value === null) {
      return false;
    } else {
      return value.toBoolean() as boolean | null;
    }
  }

  set whitelisted(value: boolean | null) {
    if (value === null) {
      this.unset("whitelisted");
    } else {
      this.set("whitelisted", Value.fromBoolean(value as boolean));
    }
  }

  get expirationDate(): BigInt | null {
    let value = this.get("expirationDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt | null;
    }
  }

  set expirationDate(value: BigInt | null) {
    if (value === null) {
      this.unset("expirationDate");
    } else {
      this.set("expirationDate", Value.fromBigInt(value as BigInt));
    }
  }

  get endDate(): BigInt | null {
    let value = this.get("endDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt | null;
    }
  }

  set endDate(value: BigInt | null) {
    if (value === null) {
      this.unset("endDate");
    } else {
      this.set("endDate", Value.fromBigInt(value as BigInt));
    }
  }

  get owner(): Bytes | null {
    let value = this.get("owner");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes | null;
    }
  }

  set owner(value: Bytes | null) {
    if (value === null) {
      this.unset("owner");
    } else {
      this.set("owner", Value.fromBytes(value as Bytes));
    }
  }

  get applicant(): Bytes | null {
    let value = this.get("applicant");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes | null;
    }
  }

  set applicant(value: Bytes | null) {
    if (value === null) {
      this.unset("applicant");
    } else {
      this.set("applicant", Value.fromBytes(value as Bytes));
    }
  }

  get deposit(): BigInt | null {
    let value = this.get("deposit");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt | null;
    }
  }

  set deposit(value: BigInt | null) {
    if (value === null) {
      this.unset("deposit");
    } else {
      this.set("deposit", Value.fromBigInt(value as BigInt));
    }
  }

  get challenges(): Array<string> | null {
    let value = this.get("challenges");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray() as Array<string> | null;
    }
  }

  set challenges(value: Array<string> | null) {
    if (value === null) {
      this.unset("challenges");
    } else {
      this.set("challenges", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class Challenge extends Entity {
  constructor(id: string) {
    this.set("id", Value.fromString(id));
    return this;
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Challenge entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Challenge entity with non-string ID"
    );
    store.set("Challenge", id.toString(), this);
  }

  static load(id: string): Challenge | null {
    return store.get("Challenge", id) as Challenge | null;
  }

  get id(): string {
    let value = this.get("id");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set id(value: string) {
    if (value === null) {
      this.unset("id");
    } else {
      this.set("id", Value.fromString(value as string));
    }
  }

  get application(): string | null {
    let value = this.get("application");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string | null;
    }
  }

  set application(value: string | null) {
    if (value === null) {
      this.unset("application");
    } else {
      this.set("application", Value.fromString(value as string));
    }
  }

  get commitEndDate(): BigInt {
    let value = this.get("commitEndDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set commitEndDate(value: BigInt) {
    if (value === null) {
      this.unset("commitEndDate");
    } else {
      this.set("commitEndDate", Value.fromBigInt(value as BigInt));
    }
  }

  get revealEndDate(): BigInt {
    let value = this.get("revealEndDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set revealEndDate(value: BigInt) {
    if (value === null) {
      this.unset("revealEndDate");
    } else {
      this.set("revealEndDate", Value.fromBigInt(value as BigInt));
    }
  }

  get challenger(): Bytes {
    let value = this.get("challenger");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes;
    }
  }

  set challenger(value: Bytes) {
    if (value === null) {
      this.unset("challenger");
    } else {
      this.set("challenger", Value.fromBytes(value as Bytes));
    }
  }

  get voter(): Bytes {
    let value = this.get("voter");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes;
    }
  }

  set voter(value: Bytes) {
    if (value === null) {
      this.unset("voter");
    } else {
      this.set("voter", Value.fromBytes(value as Bytes));
    }
  }

  get outcome(): string {
    let value = this.get("outcome");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set outcome(value: string) {
    if (value === null) {
      this.unset("outcome");
    } else {
      this.set("outcome", Value.fromString(value as string));
    }
  }

  get rewardPool(): BigInt {
    let value = this.get("rewardPool");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set rewardPool(value: BigInt) {
    if (value === null) {
      this.unset("rewardPool");
    } else {
      this.set("rewardPool", Value.fromBigInt(value as BigInt));
    }
  }

  get rewardClaimed(): boolean {
    let value = this.get("rewardClaimed");
    if (value === null) {
      return false;
    } else {
      return value.toBoolean() as boolean;
    }
  }

  set rewardClaimed(value: boolean) {
    if (value === null) {
      this.unset("rewardClaimed");
    } else {
      this.set("rewardClaimed", Value.fromBoolean(value as boolean));
    }
  }

  get totalTokens(): BigInt {
    let value = this.get("totalTokens");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set totalTokens(value: BigInt) {
    if (value === null) {
      this.unset("totalTokens");
    } else {
      this.set("totalTokens", Value.fromBigInt(value as BigInt));
    }
  }
}

export class Deposit extends Entity {
  constructor(id: string) {
    this.set("id", Value.fromString(id));
    return this;
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Deposit entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Deposit entity with non-string ID"
    );
    store.set("Deposit", id.toString(), this);
  }

  static load(id: string): Deposit | null {
    return store.get("Deposit", id) as Deposit | null;
  }

  get id(): string {
    let value = this.get("id");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set id(value: string) {
    if (value === null) {
      this.unset("id");
    } else {
      this.set("id", Value.fromString(value as string));
    }
  }

  get application(): string | null {
    let value = this.get("application");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string | null;
    }
  }

  set application(value: string | null) {
    if (value === null) {
      this.unset("application");
    } else {
      this.set("application", Value.fromString(value as string));
    }
  }

  get commitEndDate(): BigInt {
    let value = this.get("commitEndDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set commitEndDate(value: BigInt) {
    if (value === null) {
      this.unset("commitEndDate");
    } else {
      this.set("commitEndDate", Value.fromBigInt(value as BigInt));
    }
  }

  get revealEndDate(): BigInt {
    let value = this.get("revealEndDate");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set revealEndDate(value: BigInt) {
    if (value === null) {
      this.unset("revealEndDate");
    } else {
      this.set("revealEndDate", Value.fromBigInt(value as BigInt));
    }
  }

  get challenger(): Bytes {
    let value = this.get("challenger");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes;
    }
  }

  set challenger(value: Bytes) {
    if (value === null) {
      this.unset("challenger");
    } else {
      this.set("challenger", Value.fromBytes(value as Bytes));
    }
  }

  get outcome(): string {
    let value = this.get("outcome");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set outcome(value: string) {
    if (value === null) {
      this.unset("outcome");
    } else {
      this.set("outcome", Value.fromString(value as string));
    }
  }

  get rewardPool(): BigInt {
    let value = this.get("rewardPool");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set rewardPool(value: BigInt) {
    if (value === null) {
      this.unset("rewardPool");
    } else {
      this.set("rewardPool", Value.fromBigInt(value as BigInt));
    }
  }

  get totalTokens(): BigInt {
    let value = this.get("totalTokens");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set totalTokens(value: BigInt) {
    if (value === null) {
      this.unset("totalTokens");
    } else {
      this.set("totalTokens", Value.fromBigInt(value as BigInt));
    }
  }
}

export class Withdrawal extends Entity {
  constructor(id: string) {
    this.set("id", Value.fromString(id));
    return this;
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Withdrawal entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Withdrawal entity with non-string ID"
    );
    store.set("Withdrawal", id.toString(), this);
  }

  static load(id: string): Withdrawal | null {
    return store.get("Withdrawal", id) as Withdrawal | null;
  }

  get id(): string {
    let value = this.get("id");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set id(value: string) {
    if (value === null) {
      this.unset("id");
    } else {
      this.set("id", Value.fromString(value as string));
    }
  }

  get withdrew(): BigInt {
    let value = this.get("withdrew");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set withdrew(value: BigInt) {
    if (value === null) {
      this.unset("withdrew");
    } else {
      this.set("withdrew", Value.fromBigInt(value as BigInt));
    }
  }

  get newTotal(): BigInt {
    let value = this.get("newTotal");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt() as BigInt;
    }
  }

  set newTotal(value: BigInt) {
    if (value === null) {
      this.unset("newTotal");
    } else {
      this.set("newTotal", Value.fromBigInt(value as BigInt));
    }
  }

  get owner(): Bytes {
    let value = this.get("owner");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes;
    }
  }

  set owner(value: Bytes) {
    if (value === null) {
      this.unset("owner");
    } else {
      this.set("owner", Value.fromBytes(value as Bytes));
    }
  }
}

export class User extends Entity {
  constructor(id: string) {
    this.set("id", Value.fromString(id));
    return this;
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save User entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save User entity with non-string ID"
    );
    store.set("User", id.toString(), this);
  }

  static load(id: string): User | null {
    return store.get("User", id) as User | null;
  }

  get id(): string {
    let value = this.get("id");
    if (value === null) {
      return null;
    } else {
      return value.toString() as string;
    }
  }

  set id(value: string) {
    if (value === null) {
      this.unset("id");
    } else {
      this.set("id", Value.fromString(value as string));
    }
  }

  get address(): Bytes {
    let value = this.get("address");
    if (value === null) {
      return null;
    } else {
      return value.toBytes() as Bytes;
    }
  }

  set address(value: Bytes) {
    if (value === null) {
      this.unset("address");
    } else {
      this.set("address", Value.fromBytes(value as Bytes));
    }
  }
}
