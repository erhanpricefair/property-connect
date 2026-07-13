// Genuine testimonials only — fake reviews breach Australian Consumer Law.
// The homepage carousel stays hidden while this list is empty. To publish a
// testimonial, add an entry here with the consumer's permission.
export type Testimonial = {
  quote: string;
  name: string; // first name + suburb reads naturally, e.g. "Sarah, Richmond"
  service: string; // e.g. "Sold through ReferWise"
  stars: 1 | 2 | 3 | 4 | 5;
};

export const TESTIMONIALS: Testimonial[] = [];
