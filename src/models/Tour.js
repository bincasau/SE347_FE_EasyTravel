export default class Tour {
  constructor(
    tourId,
    title,
    priceAdult,
    mainImage,
    description,
    startDate,
    destination,
    percentDiscount,
    limitSeats,
    imagesHref
  ) {
    this.id = tourId;
    this.tourId = tourId;
    this.title = title;
    this.priceAdult = priceAdult;
    this.mainImage = mainImage;
    this.description = description;
    this.startDate = startDate;
    this.destination = destination;
    this.percentDiscount = percentDiscount;
    this.limitSeats = limitSeats;
    this.imagesHref = imagesHref;
  }
}
