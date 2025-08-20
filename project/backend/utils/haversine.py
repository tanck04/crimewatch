from math import radians, sin, cos, sqrt, asin

def haversine(lat1, long1, lat2, long2):
    """
    Calculate the great circle distance in kilometers between two points on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lat1, long1, lat2, long2 = map(radians, [lat1, long1, lat2, long2])

    # haversine formula
    dlon = long2 - long1
    dlat = lat2 - lat1
    a = (sin(dlat / 2) ** 2) + cos(lat1) * cos(lat2) * (sin(dlon / 2) ** 2)
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers. Use 3956 for miles
    return c * r