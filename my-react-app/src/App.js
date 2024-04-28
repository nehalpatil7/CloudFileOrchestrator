import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: "xxxxxxxxxxxxxxxxxxxxxxxxx",
    secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
});

function App() {
  const [textInput, setText] = useState('');
  const [file, setFile] = useState(null);
  const [formValid, setFormValid] = useState(true);
  const [dataSubmitted, setDataSubmit] = useState(false);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!textInput || !file) {
      setFormValid(false);
      return;
    }
    if (!file) {
      console.error('No file selected.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsText(file);
      const s3Params = {
        Bucket: 'awscdkstack-xxxxxxxxxxxxxxxxxxxxxxxxxxxx-qyn4i8jxadmg',
        Key: file.name,
        Body: file,
      };
      const s3Data = await s3Client.send(new PutObjectCommand(s3Params));

      const formData = new FormData();
      formData.append('inputText', textInput);
      formData.append('inputFileS3Path', `s3://${s3Params.Bucket}/${s3Params.Key}`);
      formData.append('fileName', file?.name);

      const dynamoDBData = await axios.post(
        'https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/save',
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          crossDomain: true,
        }
      );

      console.log('Response:', dynamoDBData.data);
      setText('');
      setFile(null);
      setFormValid(true);

      console.log('File uploaded to S3:', s3Data);
      console.log('Data saved in DynamoDB:', dynamoDBData);
      setDataSubmit(true);
    } catch (error) {
      setDataSubmit(false);
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mt-8 mb-4 text-center">Fovus Fullstack Dev position - TASK</h1>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
          placeholder="Input Text"
          value={textInput}
          onChange={handleTextChange} />
        <input
          type="file"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
          onChange={handleFileChange} />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
          Submit
        </button>
        {!formValid && <p className="text-red-500">Please fill in all fields</p>}
        {dataSubmitted && <p className="text-green-500">Data submitted succesfully.</p>}
      </form>
    </div>
  );

}

export default App;
