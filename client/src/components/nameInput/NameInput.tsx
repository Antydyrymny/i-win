import { useState } from 'react';
import { setTypedStorageItem } from '../../utils/typesLocalStorage';
import { userNameKey } from '../../data/localStorageKeys';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { Form, InputGroup, Button } from 'react-bootstrap';

function NameInput({
    disabled,
    onHostSubmit,
    onGuestSubmit,
}: {
    onHostSubmit?: (name: string) => Promise<void>;
    onGuestSubmit?: () => void;
    disabled: boolean;
}) {
    const [name, SetName] = useState(getTypedStorageItem(userNameKey) ?? '');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        SetName(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTypedStorageItem(userNameKey, name);
        if (onHostSubmit) await onHostSubmit(name);
        if (onGuestSubmit) onGuestSubmit();
    };

    return (
        <Form data-bs-theme='dark' onSubmit={handleSubmit}>
            <InputGroup>
                <Form.Control
                    placeholder='Your name'
                    value={name}
                    onChange={handleNameChange}
                    type='text'
                    autoFocus
                    required
                />
                <Form.Control.Feedback type='invalid'>
                    Please enter your name
                </Form.Control.Feedback>
                <Button type='submit' disabled={disabled} variant='warning'>
                    OK
                </Button>
            </InputGroup>
        </Form>
    );
}

export default NameInput;
