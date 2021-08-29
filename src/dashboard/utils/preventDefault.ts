export default function preventDefault<T extends Event = Event>(
  callback: (e: T) => void
) {
  return (e) => {
    e.preventDefault();
    return callback(e);
  };
}
