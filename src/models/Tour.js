export default class Tour {
  constructor(
    id,
    title,
    price,
    img,
    desc,
    schedule,
    destination,        // 👈 thay group thành destination
    percent_discount = 0,
    limit_seats = 0
  ) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.img = img;
    this.desc = desc;
    this.schedule = schedule;
    this.destination = destination; // ✅ dùng destination thay vì group
    this.percent_discount = percent_discount;
    this.limit_seats = limit_seats;
  }
}
