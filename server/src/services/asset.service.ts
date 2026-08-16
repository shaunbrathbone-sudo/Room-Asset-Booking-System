import { getPool } from '../config/database';
import { Asset } from '../types/spatial';

export const getAssets = async (category?: string, officeId?: string): Promise<Asset[]> => {
    const pool = await getPool();

    let query = 'SELECT * FROM assets WHERE is_active = 1';
    const request = pool.request();

    if (category) {
        query += ' AND category = @category';
        request.input('category', category);
    }

    if (officeId) {
        query += ' AND office_id = @officeId';
        request.input('officeId', officeId);
    }

    query += ' ORDER BY category, name';

    const result = await request.query(query);

    return result.recordset.map((row: any) => ({
        id: row.id,
        officeId: row.office_id,
        category: row.category,
        name: row.name,
        model: row.model,
        identifierCode: row.identifier_code,
        photoUrl: row.photo_url,
        description: row.description,
        requiresApproval: !!row.requires_approval,
        requiresLicense: !!row.requires_license,
        currentMileage: row.current_mileage,
        fuelOrBattery: row.fuel_or_battery,
        specifications: row.specifications,
        status: row.status,
        isActive: !!row.is_active,
    }));
};

export const getAssetById = async (id: string): Promise<Asset | null> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM assets WHERE id = @id AND is_active = 1');

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];
    return {
        id: row.id,
        officeId: row.office_id,
        category: row.category,
        name: row.name,
        model: row.model,
        identifierCode: row.identifier_code,
        photoUrl: row.photo_url,
        description: row.description,
        requiresApproval: !!row.requires_approval,
        requiresLicense: !!row.requires_license,
        currentMileage: row.current_mileage,
        fuelOrBattery: row.fuel_or_battery,
        specifications: row.specifications,
        status: row.status,
        isActive: !!row.is_active,
    };
};