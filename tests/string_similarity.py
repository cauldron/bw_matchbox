from bw_matchbox.utils import name_close_enough


def test_string_similarity():
    a = "building construction, multi-storey"
    b = "building, multi-storey"
    assert name_close_enough(a, b)

    a = "roads, company, internal"
    b = "market for road, company, internal"
    assert name_close_enough(a, b)
