export function createRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

export function getRandomItemInArray(array: any[]) {
  return array[Math.floor(Math.random() * array.length)]
}
