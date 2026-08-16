import { randomUUID } from 'crypto';
import { getPool } from '../config/database';

export interface CreateFeatureParams {
    userId: string;
    title: string;
    problemStatement: string;
    businessImpact: string;
    category?: string;
}

export interface FeatureRequestItem {
    id: string;
    userId: string;
    authorName: string;
    title: string;
    problemStatement: string;
    businessImpact: string;
    category: string;
    status: string;
    moderationNotes: string | null;
    upvotesCount: number;
    hasUserUpvoted?: boolean;
    createdAt: string;
}

/**
 * Submit a feature request (enters 'pending_moderation').
 */
export const submitFeatureRequest = async (params: CreateFeatureParams): Promise<string> => {
    const pool = await getPool();
    const id = randomUUID();

    await pool.request()
        .input('id', id)
        .input('userId', params.userId)
        .input('title', params.title)
        .input('problemStatement', params.problemStatement)
        .input('businessImpact', params.businessImpact)
        .input('category', params.category || 'general')
        .query(`
            INSERT INTO feature_requests (id, user_id, title, problem_statement, business_impact, category, status)
            VALUES (@id, @userId, @title, @problemStatement, @businessImpact, @category, 'pending_moderation')
        `);

    return id;
};

/**
 * Get published feature requests with user upvote status.
 */
export const getPublicFeatures = async (currentUserId?: string): Promise<FeatureRequestItem[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .query(`
            SELECT
                f.*,
                u.first_name + ' ' + u.last_name AS author_name
            FROM feature_requests f
            JOIN users u ON u.id = f.user_id
            WHERE f.status IN ('approved', 'planned', 'in_development', 'completed')
            ORDER BY f.upvotes_count DESC, f.created_at DESC
        `);

    let userUpvotes = new Set<string>();
    if (currentUserId) {
        const upvoteRes = await pool.request()
            .input('userId', currentUserId)
            .query('SELECT feature_id FROM feature_upvotes WHERE user_id = @userId');
        userUpvotes = new Set(upvoteRes.recordset.map((r: any) => r.feature_id));
    }

    return result.recordset.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        authorName: row.author_name,
        title: row.title,
        problemStatement: row.problem_statement,
        businessImpact: row.business_impact,
        category: row.category,
        status: row.status,
        moderationNotes: row.moderation_notes,
        upvotesCount: row.upvotes_count,
        hasUserUpvoted: userUpvotes.has(row.id),
        createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
    }));
};

/**
 * Get pending feature requests for admin moderation.
 */
export const getPendingFeatures = async (): Promise<FeatureRequestItem[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .query(`
            SELECT
                f.*,
                u.first_name + ' ' + u.last_name AS author_name
            FROM feature_requests f
            JOIN users u ON u.id = f.user_id
            WHERE f.status = 'pending_moderation'
            ORDER BY f.created_at ASC
        `);

    return result.recordset.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        authorName: row.author_name,
        title: row.title,
        problemStatement: row.problem_statement,
        businessImpact: row.business_impact,
        category: row.category,
        status: row.status,
        moderationNotes: row.moderation_notes,
        upvotesCount: row.upvotes_count,
        createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
    }));
};

/**
 * Moderate a feature request (Approve, Reject, or update roadmap status).
 */
export const moderateFeature = async (
    featureId: string,
    status: 'approved' | 'rejected' | 'planned' | 'in_development' | 'completed',
    notes?: string
): Promise<void> => {
    const pool = await getPool();

    await pool.request()
        .input('id', featureId)
        .input('status', status)
        .input('notes', notes || null)
        .query(`
            UPDATE feature_requests
            SET status = @status, moderation_notes = @notes, updated_at = GETUTCDATE()
            WHERE id = @id
        `);
};

/**
 * Toggle Upvote (+1 / -1 per user limit).
 */
export const toggleUpvote = async (featureId: string, userId: string): Promise<{ upvoted: boolean; count: number }> => {
    const pool = await getPool();

    const check = await pool.request()
        .input('featureId', featureId)
        .input('userId', userId)
        .query('SELECT * FROM feature_upvotes WHERE feature_id = @featureId AND user_id = @userId');

    if (check.recordset.length > 0) {
        // Remove vote
        await pool.request()
            .input('featureId', featureId)
            .input('userId', userId)
            .query('DELETE FROM feature_upvotes WHERE feature_id = @featureId AND user_id = @userId');

        await pool.request()
            .input('featureId', featureId)
            .query('UPDATE feature_requests SET upvotes_count = upvotes_count - 1 WHERE id = @featureId');

        const updated = await pool.request()
            .input('featureId', featureId)
            .query('SELECT upvotes_count FROM feature_requests WHERE id = @featureId');

        return { upvoted: false, count: updated.recordset[0].upvotes_count };
    } else {
        // Cast vote
        await pool.request()
            .input('featureId', featureId)
            .input('userId', userId)
            .query('INSERT INTO feature_upvotes (feature_id, user_id) VALUES (@featureId, @userId)');

        await pool.request()
            .input('featureId', featureId)
            .query('UPDATE feature_requests SET upvotes_count = upvotes_count + 1 WHERE id = @featureId');

        const updated = await pool.request()
            .input('featureId', featureId)
            .query('SELECT upvotes_count FROM feature_requests WHERE id = @featureId');

        return { upvoted: true, count: updated.recordset[0].upvotes_count };
    }
};