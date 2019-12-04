// derivative of reference code  for creating example data iwth  office-ui-fabric-react.

const DATA = {    
  roomNames: [
                '1st Floor - Engineering Conference Room', 
                '2nd Floor - Conference Room (Services)', 
                '2nd Floor - Conference Room (Sales)'
              ],
  available: ['true', 'false']  
};

export interface IExampleItem {
  key: string;
  roomName: string;
  roomBuildingAndNumber: string;
  available: boolean;
  capacity: number;
};

export function createListItems(count: number, startIndex: number = 0): IExampleItem[] {
  return Array.apply(null, Array(count)).map((item: number, index: number) => {

    var roomName = _randWord(DATA.roomNames);

    return {
      key: 'item-' + (index + startIndex) + (item === undefined ? '-empty' : '-not empty'),
      roomId: 'room-' + index,
      roomName: roomName,
      roomBuildingAndNumber: roomName, // same as roomName for now
      available: 'true' ===_randWord(DATA.available),
      capacity: _randNumber(4, 24)
    };
  });
};

function _randWord(array: string[]): string {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

function _randNumber(min: number, max: number): number {
  let range = max - min;
  const number = Math.floor(min + (Math.random() * range));
  return number;
};
