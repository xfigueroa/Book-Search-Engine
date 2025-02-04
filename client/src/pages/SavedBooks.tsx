import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import { GET_ME } from '../utils/queries';
import { DELETE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data using GraphQL query
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  // Define delete book mutation
  const [deleteBook] = useMutation(DELETE_BOOK, {
    update(cache, { data: { deleteBook } }) {
      const { me } = (cache.readQuery({ query: GET_ME }) as { me: any }) || { me: {} };
      cache.writeQuery({
        query: GET_ME,
        data: { me: { ...me, savedBooks: deleteBook.savedBooks } },
      });
    },
  });

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // Function to delete a book
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;
  
    try {
      const { data } = await deleteBook({
        variables: { bookId },
        update(cache, { data: { deleteBook } }) {
          const { me } = (cache.readQuery({ query: GET_ME }) as { me: any }) || { me: {} };
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...me, savedBooks: deleteBook.savedBooks } },
          });
        },
      });
  
      console.log("✅ Book deleted:", data);
      removeBookId(bookId);
    } catch (err) {
      console.error("❌ Error deleting book:", err);
    }
  };
  

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book: {
            bookId: string; 
            title: string; 
            authors: string[]; 
            description: string; 
            image?: string;
            }) => {
            return (
              <Col md='4' key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
