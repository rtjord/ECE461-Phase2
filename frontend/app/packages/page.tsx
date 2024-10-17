"use client"; // Mark this as a Client Component

import { useEffect, useState } from 'react';

interface Package {
    id: string;
    name: string;
    author: string;
    version: string;
    description: string;
}

export default function PackageDirectory() {
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
        async function fetchPackages() {
            const fakePackages: Package[] = [
                { id: '1', name: 'Package One', author: 'Author One', version: '1.0.0', description: 'This is the first package' },
                { id: '2', name: 'Package Two', author: 'Author Two', version: '2.0.0', description: 'This is the second package' },
                { id: '3', name: 'Package Three', author: 'Author Three', version: '3.0.0', description: 'This is the third package' },
            ];
            setPackages(fakePackages);
        }

        fetchPackages();
    }, []);
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '80vw', backgroundColor: 'offwhite' }}>
            <div>
                <h2>Package Directory</h2>
                <table className="package-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Author</th>
                            <th>Version</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map(pkg => (
                            <tr key={pkg.id}>
                                <td>
                                    <a href={`/packages/${pkg.name}`} style={{ textDecoration: 'none', color: 'blue' }}>
                                        {pkg.name}
                                    </a>
                                </td>
                                <td>{pkg.author}</td>
                                <td>v{pkg.version}</td>
                                <td>{pkg.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}