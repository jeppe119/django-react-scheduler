import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import Login from './components/Login';

// Configure axios defaults BEFORE the component
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;

function App() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Only check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/');
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        extendedProps: {
          description: event.description
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // If fetch fails, token is invalid
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  };

  const handleDateSelect = async (selectInfo) => {
    const title = prompt('Enter event title:');
    if (title) {
      try {
        const eventData = {
          title: title,
          start_time: selectInfo.start.toISOString(),
          end_time: selectInfo.end.toISOString(),
          description: ''
        };
        
        await axios.post('/api/events/', eventData);
        fetchEvents();
        selectInfo.view.calendar.unselect();
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Error creating event. Please try logging in again.');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
    setEvents([]);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Show loading while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show login component if not logged in
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Scheduler
        </Typography>
        <Box>
          <Button variant="contained" onClick={fetchEvents} sx={{ mr: 2 }}>
            Load Events
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        events={events}
        height="auto"
      />
    </Container>
  );
}

export default App;
