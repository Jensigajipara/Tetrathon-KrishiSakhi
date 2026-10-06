import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API Key:', apiKey ? apiKey.slice(0, 10) + '...' : 'MISSING');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

axios.get(url)
  .then(res => {
    console.log('Supported Models:');
    res.data.models.forEach(m => {
      console.log(`- Name: ${m.name}`);
    });
  })
  .catch(err => {
    console.error('API Error:', err.response?.data || err.message);
  });
