import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const lat = searchParams.get('lat');
//   const lon = searchParams.get('lon');
//   const q = searchParams.get('q');

//   const response = await fetch(
//     `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
//     {
//       headers: {
//         'User-Agent': 'greenbasket' 
//       }
//     }
//   );

//   const data = await response.json();
//   return NextResponse.json(data);
// }


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q'); 

  if ((lat && !lon) || (!lat && lon)) {
    return NextResponse.json(
      { error: "Both latitude and longitude are required" },
      { status: 400 }
    );
  }
  

  try {
    let url = "";

    if (q) {
      
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=1`;
    } else if (lat && lon) {
      
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    } else {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'greenbasket' 
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}