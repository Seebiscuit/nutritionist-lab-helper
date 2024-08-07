import { NextApiRequest, NextApiResponse } from 'next';
import { labService } from '../../../services/labService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const csvContent = req.body.csvContent;
            await labService.processLabsCsv(csvContent);
            res.status(200).json({ message: 'Lab data uploaded successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error uploading lab data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}