import express from 'express';
import { Request, Response, Application } from 'express';
import { z } from 'zod';
import bodyParser from 'body-parser';
import * as fs from 'fs/promises';
import cors from 'cors';

const createPuppySchema = z.object({
  id: z.number(),
  name: z.string(),
  breed: z.string(),
  birthDate: z.date(),
});

const updatedPuppySchema = z.object({
  name: z.string().optional(),
  breed: z.string().optional(),
  birthDate: z.date().optional(),
});

const app: Application = express();

app.use(bodyParser.json());
app.use(express.json());

const allowedOrigins = ["http://localhost:3000"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};
app.use(cors(options))

app.put('/api/puppies/:id', async (req: Request, res: Response) => {
  console.log('Entered PUT');
  const id = req.params.id as string;
  try {
    const updatedPuppy = updatedPuppySchema.parse(req.body);
    const puppiesArray = await fs
      .readFile('data/puppies.json')
      .then((data) => JSON.parse(data.toString()));
    const updatedArray = puppiesArray.map((puppy) => {
      if (Number(id) == puppy.id) {
        return {
          ...puppy,
          ...updatedPuppy,
        };
      }
      return puppy;
    });
    await fs.writeFile('data/puppies.json', JSON.stringify(updatedArray, null, 2));
    return res.status(204).end();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.message });
  }
});

app.get('/api/puppies/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const puppies = await fs
      .readFile('data/puppies.json')
      .then((data) => JSON.parse(data.toString()));
    const puppy = puppies.find((puppy) => puppy.id == Number(id));
    if (puppy) {
      return res.status(200).json(puppy);
    }
    return res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(401).json({ message: 'Id must be a number' });
  }
});

app.get('/api/test', (_req: Request, res: Response) => {
  return res.status(200).json({ test: 'is working as it should' });
});

app.get('/api/puppies', async (_req: Request, res: Response) => {
  const puppies = await fs
    .readFile('data/puppies.json')
    .then((data) => JSON.parse(data.toString()));
  return res.status(200).json(puppies);
});

app.post('/api/puppies', async (req: Request, res: Response) => {
  try {
    const newPuppie = createPuppySchema.parse(req.body);
    const puppiesArray = await fs
      .readFile('data/puppies.json')
      .then((data) => JSON.parse(data.toString()));
    puppiesArray.push(newPuppie);
    await fs.writeFile('data/puppies.json', JSON.stringify(puppiesArray, null, 2));
    return res.status(200).json(puppiesArray.find((puppy) => puppy.id == newPuppie.id));
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.message });
  }
});

app.delete('/api/puppies/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const puppiesArray = await fs
      .readFile('data/puppies.json')
      .then((data) => JSON.parse(data.toString()));

      const index = puppiesArray.puppies.findIndex(puppy => Number(id) === puppy.id);
       puppiesArray.puppies.splice(index, 1);
      
   
    await fs.writeFile('data/puppies.json', JSON.stringify(puppiesArray, null, 2));
    return res.status(204).end();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
});

export default app;
