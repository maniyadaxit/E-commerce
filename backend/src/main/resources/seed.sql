INSERT INTO users (id, name, email, phone, password_hash, role, is_enabled, birthday)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Aurora Gems Owner',
        'maniyadaxit1234@gmail.com',
        '9327134439',
        '{noop}Daxit@9327134439',
        'OWNER',
        TRUE,
        '1990-08-12'
    )
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_enabled = EXCLUDED.is_enabled,
    birthday = EXCLUDED.birthday;

INSERT INTO collections (name, handle, description, banner_image_url, is_active, sort_order)
VALUES
    (
        'Signature Rings',
        'rings',
        'Statement rings, stackables, and everyday silhouettes for the Aurora Gems core assortment.',
        'https://placehold.co/1600x720/png?text=Signature+Rings',
        TRUE,
        1
    ),
    (
        'Luminous Pendants',
        'pendants',
        'Pendant designs that keep gifting edits and hero placements ready from the first launch.',
        'https://placehold.co/1600x720/png?text=Luminous+Pendants',
        TRUE,
        2
    ),
    (
        'Modern Earrings',
        'earrings',
        'Studs, drops, and occasion pairs prepared for the storefront navigation and collection pages.',
        'https://placehold.co/1600x720/png?text=Modern+Earrings',
        TRUE,
        3
    ),
    (
        'Sculpted Bracelets',
        'bracelets',
        'Bracelets and wristwear edits so new products can be added into a ready-made collection immediately.',
        'https://placehold.co/1600x720/png?text=Sculpted+Bracelets',
        TRUE,
        4
    )
ON CONFLICT (handle) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    banner_image_url = EXCLUDED.banner_image_url,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;
