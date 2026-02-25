export function notify({ to, title, message, meta = {} }) {
  console.log("📣 NOTIFICATION");
  console.log("To:", to);
  console.log("Title:", title);
  console.log("Message:", message);
  console.log("Meta:", meta);
  console.log("----");
}