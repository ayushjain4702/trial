const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Login Screen
app.get('/', (req, res) => {
  res.render('login');
});

// Authenticate user
// Authenticate user
app.post('/login', async (req, res) => {
    const { login_id, password } = req.body;
  
    try {
      // Make API call to authenticate user
      const authResponse = await axios.post('https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp', {
        login_id,
        password
      });
  
      // Extract the received token
      const token = authResponse.data.access_token;
  
      // Redirect to the customerList route with the token as a query parameter
      res.redirect(`/customerList?token=${token}`);
    } catch (error) {
      // Log the error details
      console.error('Authentication Error:', error.message);
      res.status(error.response?.status || 500).send(error.response?.statusText || 'Internal Server Error');
    }
  });
  
// Customer List Screen
// Customer List Screen
app.get('/customerList', async (req, res) => {
    const token = req.query.token;
  
    try {
      // Make API call to get customer list
      const response = await axios.get('https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const customers = response.data;
  
      // Log the token before rendering the template
      console.log('Token before rendering:', token);
  
      // Render Customer List Screen with the retrieved customer data
      res.render('customerList', { customers, token });
    } catch (error) {
      // Handle API error
      console.error('API Error:', error.message);
      res.status(error.response?.status || 500).send(error.response?.statusText || 'Internal Server Error');
    }
  });
  
  

// Add a new customer
app.get('/addCustomer', (req, res) => {
    const token = req.query.token;
    res.render('addCustomer', { token });
  });
  
  // Handle form submission for adding a new customer
  app.post('/addCustomer', async (req, res) => {
    const token = req.body.token;
    const customerData = req.body;
  
    try {
      // Make API call to create a new customer
      const response = await axios.post('https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create', customerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.status === 201) {
        // Redirect to the customerList route with the token as a query parameter
        res.redirect(`/customerList?token=${token}`);
      } else {
        // Render failure message if needed
        res.status(response.status).send(response.statusText);
      }
    } catch (error) {
      // Handle API error
      res.status(error.response.status).send(error.response.statusText);
    }
  });

  // ...

// Update a customer
app.get('/updateCustomer', (req, res) => {
    const token = req.query.token;
    const uuid = req.query.uuid;
  
    // Render the updateCustomer.ejs template with the token and customer uuid
    res.render('updateCustomer', { token, uuid });
  });
  
  // Handle form submission for updating a customer
  app.post('/updateCustomer', async (req, res) => {
    const token = req.body.token;
    const uuid = req.body.uuid;
    const updatedCustomerData = req.body;
  
    try {
      // Make API call to update the customer
      const response = await axios.post('https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=update', updatedCustomerData, {
        headers: { Authorization: `Bearer ${token}` },
        params: { uuid } // Include the customer uuid as a query parameter
      });
  
      // Check if the customer was successfully updated (assuming a 200 status code)
      if (response.status === 200) {
        // Redirect to the customerList route with the token as a query parameter
        res.redirect(`/customerList?token=${token}`);
      } else {
        // Render failure message if needed
        res.status(response.status).send(response.statusText);
      }
    } catch (error) {
      // Handle API error
      res.status(error.response.status).send(error.response.statusText);
    }
  });
  
  // Delete a customer
  // Delete a customer
app.delete('/deleteCustomer/:uuid', async (req, res) => {
    const token = req.query.token;
    const uuid = req.params.uuid;
  
    try {
      // Log the token and uuid for debugging purposes
      console.log('Token:', token);
      console.log('UUID:', uuid);
  
      // Make API call to delete the customer
      const response = await axios.post(
        'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete',
        { uuid }, // Send uuid in the request body
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Log the response for debugging purposes
      console.log('Delete Customer API Response:', response.data);
  
      // Check if the customer was successfully deleted (assuming a 200 status code)
      if (response.status === 200) {
        // Respond with a success message
        res.status(response.status).send('Successfully deleted');
      } else {
        // Respond with an error message if needed
        res.status(response.status).send(response.statusText);
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error deleting customer:', error.message);
  
      // Handle API error
      res.status(error.response?.status || 500).send(error.response?.statusText || 'Internal Server Error');
    }
  });
      
  
  
// Set up the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
