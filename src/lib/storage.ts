import { supabase } from './supabase';

export const uploadFile = async (
    file: File,
    bucket: string,
    path: string
): Promise<{ data: { path: string } | null; error: Error | null }> => {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${path}/${fileName}`

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file)

        if (error) {
            return { data: null, error }
        }

        return { data: { path: filePath }, error: null }
    } catch (error) {
        return { data: null, error: error as Error }
    }
}

export const getFileUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

export const deleteFile = async (
    bucket: string,
    path: string
): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path])
        return { error }
    } catch (error) {
        return { error: error as Error }
    }
}
