export enum Permission {
  all = 0b11111,
  delete = 0b10000,
  update = 0b01000,
  create = 0b00100,
  list = 0b00010,
  read = 0b00001,
  view = 0b00011,
}
