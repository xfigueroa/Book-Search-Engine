export interface Book {
  id: string;

  volumeInfo: {

    title: string;

    authors?: string[];

    description?: string;

    imageLinks?: {

      thumbnail?: string;

    };

    infoLink?: string;

  };
}
