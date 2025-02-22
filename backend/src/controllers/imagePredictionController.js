
const { FLASK_ENDPOINT } = process.env;
import FormData from 'form-data';
import fetch from 'node-fetch'; 

export const partsClassification = async (req, res) => {
  try {
    console.log('req received');
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // First get JWT token
    const loginResponse = await fetch(`${FLASK_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    console.log(loginData, 'jwt');
    if (!loginData.token) {
      return res.status(401).send({ message: 'Authentication failed' });
    }

    // Create FormData and append the image
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Make request to Flask endpoint with token and image
    const response = await fetch(`${FLASK_ENDPOINT}/tree-part-cls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        ...formData.getHeaders() // This is crucial for setting the correct Content-Type
      },
      body: formData
    });

    const data = await response.json();
    console.log(data, 'data');
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};