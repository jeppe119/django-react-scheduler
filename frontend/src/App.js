import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import Login from './components/Login';

// Configure axios defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;

function App() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load events when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents();
    }
  }, [isLoggedIn]);

  const checkAuthStatus = async () => {
    try {
      await axios.get('/api/events/');
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

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
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api-auth/logout/');
      setIsLoggedIn(false);
      setEvents([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

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
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
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
