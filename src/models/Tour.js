export default class Tour {
  constructor(
    tourId,
    title,
    priceAdult,
    mainImage,
    description,
    startDate,
    endDate,
    destination,
    percentDiscount,
    limitSeats,
    imagesHref,
    durationDays
  ) {
    this.id = tourId;
    this.tourId = tourId;
    this.title = title;
    this.priceAdult = Number(priceAdult) || 0;
    this.mainImage = mainImage;
    this.description = description;

    // ⭐ Quan trọng — gán giá trị start & end
    this.startDate = startDate || null;
    this.endDate = endDate || null;

    this.destination = destination;
    this.percentDiscount = percentDiscount || 0;
    this.limitSeats = limitSeats;

    this.imagesHref = imagesHref;
    this.durationDays = durationDays || 0;
  }
}
