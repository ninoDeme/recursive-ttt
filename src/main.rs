// use recursive_ttt::{describe_component, construct_game_state, playmove};
// fn main() {
//     let res = construct_game_state(&["CORE-BOARD", "CORE-SPACE"], None);
//
//     println!("{res:?}");
//
//     println!("{}", describe_component(&playmove(&["1-5"], &res).unwrap()));
// }
use std::iter::Peekable;
use std::net::SocketAddr;

use http_body_util::{Full, combinators::BoxBody, BodyExt, Empty};
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response, StatusCode, Method};
use hyper_util::rt::TokioIo;
use tokio::net::TcpListener;


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));

    // We create a TcpListener and bind it to 127.0.0.1:3000
    let listener = TcpListener::bind(addr).await?;

    // We start a loop to continuously accept incoming connections
    loop {
        let (stream, _) = listener.accept().await?;

        // Use an adapter to access something implementing `tokio::io` traits as if they implement
        // `hyper::rt` IO traits.
        let io = TokioIo::new(stream);

        // Spawn a tokio task to serve multiple connections concurrently
        tokio::task::spawn(async move {
            // Finally, we bind the incoming connection to our `hello` service
            if let Err(err) = http1::Builder::new()
                // `service_fn` converts our function in a `Service`
                .serve_connection(io, service_fn(root_server))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}

async fn root_server(b: Request<hyper::body::Incoming>) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    let path = String::from(b.uri().path());
    let mut path_parts = path.split("/").peekable();
    // println!("{:?}", path_parts..collect::<Vec<_>>());
    path_parts.next().unwrap();
    match path_parts.next() {
        Some("api") => api_server(b, path_parts).await,
        _ => {
            let mut not_found = Response::new(empty());
            *not_found.status_mut() = StatusCode::NOT_IMPLEMENTED;
            Ok(not_found)
        }
    }
}


async fn api_server(b: Request<hyper::body::Incoming>, mut path_parts: Peekable<impl Iterator<Item = &str>>) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    match path_parts.next() {
        Some("version") => Ok(Response::new(full("v0.0.1"))),
        _ => {
            let mut not_found = Response::new(empty());
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
    }
}

// We create some utility functions to make Empty and Full bodies
// fit our broadened Response body type.
fn empty() -> BoxBody<Bytes, hyper::Error> {
    Empty::<Bytes>::new()
        .map_err(|never| match never {})
        .boxed()
}
fn full<T: Into<Bytes>>(chunk: T) -> BoxBody<Bytes, hyper::Error> {
    Full::new(chunk.into())
        .map_err(|never| match never {})
        .boxed()
}
