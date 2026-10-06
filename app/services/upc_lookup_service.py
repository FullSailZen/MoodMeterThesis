import requests


UPC_LOOKUP_URL = "https://api.upcitemdb.com/prod/trial/lookup"


def lookup_upc(upc: str) -> dict | None:
    response = requests.get(
        UPC_LOOKUP_URL,
        params={
            "upc": upc
        },
        headers={
            "Accept": "application/json"
        },
        timeout=10
    )

    if response.status_code == 400:
        error_data = response.json()

        return {
            "status": "invalid_upc",
            "upc": upc,
            "message": error_data.get(
                "message",
                "UPCitemdb rejected the UPC"
            ),
            "product": None
        }

    if response.status_code == 404:
        return {
            "status": "not_found",
            "upc": upc,
            "product": None
        }

    if response.status_code == 429:
        return {
            "status": "rate_limited",
            "upc": upc,
            "product": None
        }

    response.raise_for_status()

    data = response.json()

    items = data.get("items", [])

    if not items:
        return {
            "status": "not_found",
            "upc": upc,
            "product": None
        }

    item = items[0]

    offers = item.get("offers", [])

    prices = [
        offer.get("price")
        for offer in offers
        if offer.get("price") is not None
    ]

    return {
        "status": "found",
        "upc": item.get("upc"),
        "ean": item.get("ean"),
        "title": item.get("title"),
        "brand": item.get("brand"),
        "category": item.get("category"),
        "lowest_price": min(prices) if prices else None,
        "highest_price": max(prices) if prices else None,
        "offers": offers
    }