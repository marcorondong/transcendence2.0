export let items = [
  { id: 1, name: 'item1' },
  { id: 2, name: 'item2' },
  { id: 3, name: 'item3' }
];

export interface itemInterface {
  id: number;
  name: string;
}

export interface Params {
  id: string;
  name: string;
}

export interface AddItemBody {
  name: string;
}