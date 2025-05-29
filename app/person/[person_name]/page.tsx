// app/person/[person_name]/page.tsx

// Define the props the component expects, including the dynamic segment
interface PersonPageProps {
    params: {
        person_name: string; // The name of the dynamic segment matches the folder name
    };
}

// Async function to fetch data for a person
async function getPersonDetails(personName: string) {
    // Construct the API URL dynamically with the person's name
    const apiUrl = `https://search.dip.bundestag.de/api/v1/person?f.person=${encodeURIComponent(personName)}&format=json&apikey=OSOegLs.PR2lwJ1dwCeje9vTj7FPOt3hvpYKtwKkhw`;

    try {
        const res = await fetch(apiUrl);

        let data;

        if (!res.ok) {
            // Handle HTTP errors
            console.error(`HTTP error! status: ${res.status}`);
            // You might want to throw a specific error or return a structured error object
            return { error: `Error fetching data: ${res.statusText}` };
        } else {
            data = await res.json();
        }

        // Check if documents array exists and has data
        if (data.documents && data.documents.length > 0) {
            return data.documents[0]; // Return the first document (assuming one match for a specific person)
        } else {
            // No documents found for the given name
            return { error: `No person found with the name "${personName}"` };
        }

    } catch (error) {
        // Handle network errors or other exceptions during fetch
        console.error('Fetch error:', error);
        return { error: 'An error occurred while fetching data.' };
    }
}

// The component for the dynamic route
export default async function PersonPage({ params }: PersonPageProps) {
    const personName = params.person_name;

    // Fetch the person's details on the server before rendering
    const personDetails = await getPersonDetails(personName);

    // Check if there was an error fetching data
    if (personDetails.error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{personDetails.error}</p>
            </div>
        );
    }

    // Assuming personDetails is the first document from the API response
    const person = personDetails; // Renaming for clarity

    return (
        <div>
            {/* Display the fetched person's details */}
            <h1>Details for {person.vorname} {person.nachname}</h1>

            <p><strong>Title:</strong> {person.titel}</p>
            <p><strong>Fraction (Fraktion):</strong> {person.fraktion ? person.fraktion.join(', ') : 'N/A'}</p>
            <p><strong>Function (Funktion):</strong> {person.funktion ? person.funktion.join(', ') : 'N/A'}</p>
            <p><strong>Wahlperiode:</strong> {person.wahlperiode ? person.wahlperiode.join(', ') : 'N/A'}</p>
            <p><strong>Last Updated:</strong> {new Date(person.aktualisiert).toLocaleDateString()}</p>
            <p><strong>Datum:</strong> {new Date(person.datum).toLocaleDateString()}</p>
            <p><strong>Basisdatum:</strong> {new Date(person.basisdatum).toLocaleDateString()}</p>

            {/* Add other details you want to display */}
        </div>
    );
}
