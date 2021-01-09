export default function preventDefault(callback: () => any) {
  return (e) => {
    e.preventDefault();
    return callback();
  };
}
