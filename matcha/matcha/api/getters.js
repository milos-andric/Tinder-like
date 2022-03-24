export const getUserInfos = async (id) => {
    try {
        const data = await global.db.one('SELECT * FROM users WHERE user_id = $1', id)
        delete data.password;

        if (data.profile_pic)
            data.profile_pic = await global.db.oneOrNone('SELECT * FROM images WHERE image_id = $1', data.profile_pic)
        return data;

    } catch (e) {
        throw new Error('User is not found');
    }
};

export const getUserImages = async (id) => {
    try {
        return await global.db.any('SELECT * FROM images WHERE user_id = $1', id);
    } catch (e) {
        throw new Error('Database error');
    }
};