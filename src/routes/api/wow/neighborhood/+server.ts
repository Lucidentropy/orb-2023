import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const plots = [
            { id: 26, status: 'owned', owner: { name: 'Akinyele' } },
            { id: 52, status: 'owned', owner: { name: 'Aleys' } },
            { id: 1, status: 'owned', owner: { name: 'Bazzul' } },
            { id: 24, status: 'owned', owner: { name: 'Beriks' } },
            { id: 49, status: 'owned', owner: { name: 'Bingo' } },
            { id: 37, status: 'owned', owner: { name: 'Ecks' } },
            { id: 9, status: 'owned', owner: { name: 'Gaxie' } },
            { id: 8, status: 'owned', owner: { name: 'Goonette' } },
            { id: 48, status: 'owned', owner: { name: 'Grimkahuna' } },
            { id: 12, status: 'owned', owner: { name: 'Hammeryou' } },
            { id: 35, status: 'owned', owner: { name: 'Hyakkimaru' } },
            { id: 42, status: 'owned', owner: { name: 'Imaretpally' } },
            { id: 21, status: 'owned', owner: { name: 'Iotus' } },
            { id: 27, status: 'owned', owner: { name: 'Lucid' } },
            { id: 53, status: 'owned', owner: { name: 'Mathematik' } },
            { id: 39, status: 'owned', owner: { name: 'Mentova' } },
            { id: 30, status: 'owned', owner: { name: 'Murrdyn' } },
            { id: 43, status: 'owned', owner: { name: 'Phalan' } },
            { id: 19, status: 'owned', owner: { name: 'Rozco' } },
            { id: 7, status: 'owned', owner: { name: 'Snarfy' } },
            { id: 13, status: 'owned', owner: { name: 'Vulpixi' } },
            { id: 46, status: 'owned', owner: { name: 'Zandivya' } }
        ];

        return json({
            plots,
            meta: {
                fetchedAt: new Date().toISOString()
            }
        });
    } catch (error: unknown) {
        return json(
            {
                error: true,
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
};