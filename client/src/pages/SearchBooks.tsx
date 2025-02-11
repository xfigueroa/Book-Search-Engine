import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../utils/auth';
import { SAVE_BOOK } from '../utils/mutations';

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  interface Book {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    link: string;
  }

  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [saveBook] = useMutation(SAVE_BOOK);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
      const { items } = await response.json();
      setSearchedBooks(items.map((book: any) => ({
        bookId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || ['Unknown'],
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (book: any) => {
    try {
      await saveBook({ variables: { book } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container>
        <h1>Search for Books!</h1>
        <Form onSubmit={handleSearch}>
          <Row>
            <Col xs={12} md={8}>
              <Form.Control
                name='searchInput'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type='text'
                size='lg'
                placeholder='Search for a book'
              />
            </Col>
            <Col xs={12} md={4}>
              <Button type='submit' variant='success' size='lg'>Submit Search</Button>
            </Col>
          </Row>
        </Form>
      </Container>
      
      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`Cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button className='btn-block btn-info' onClick={() => handleSaveBook(book)}>
                      Save this Book!
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
