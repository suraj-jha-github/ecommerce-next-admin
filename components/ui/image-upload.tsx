"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
    single?: boolean; // For single image upload (like billboards)
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    single = false
}) => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, [])
    


    if (!isMounted) {
        return null;
    }


    return (
        <div>
            <div className='mb-4 flex items-center gap-4'>
                {value.filter((url, index, self) => self.indexOf(url) === index).map((url) => (
                    <div key={url} className='relative w-[200px] h-[200px] rounded-md overflow-hidden'>
                        <div className='z-10 absolute top-2 right-2'>
                            <Button type='button' onClick={() => onRemove(url)} variant="destructive" size="icon">
                                <Trash className='w-4 h-4'/>
                            </Button>
                        </div>
                        <Image fill className='object-cover' alt='Image' src={url} />
                    </div>
                ))}
            </div>
            {single && value.length > 0 && (
                <div className='text-sm text-gray-500 mb-2'>
                    Only one image allowed for this field
                </div>
            )}
            <CldUploadWidget 
                uploadPreset='my_unsigned_present'
                onSuccess={(result: any) => {
                    console.log('Upload result:', result);
                    if (result?.info?.secure_url) {
                        console.log('Secure URL:', result.info.secure_url);
                        const newUrl = result.info.secure_url;
                        
                        // Check if URL already exists
                        if (value.includes(newUrl)) {
                            console.log('URL already exists, skipping');
                            return;
                        }
                        
                        if (single) {
                            // For single image, clear all existing images first
                            value.forEach(url => onRemove(url));
                            // Then add the new image
                            onChange(newUrl);
                        } else {
                            // For multiple images, just add the new one
                            onChange(newUrl);
                        }
                    }
                }}
            >
                {({ open }) => {
                    const onClick = () => {
                        open();
                    }

                    return (
                        <Button type='button' disabled={disabled} variant={'secondary'} onClick={onClick}>
                            <ImagePlus className='h-4 w-4 mr-2' />
                            Upload an Image
                        </Button>
                    )
                }}
            </CldUploadWidget>
        </div>
    )
};

export default ImageUpload